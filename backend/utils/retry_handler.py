"""
Sistema de reintentos inteligente para descargas de YouTube
Intenta múltiples estrategias cuando encuentra errores 403
"""
import time
from typing import Callable, Any
from yt_dlp.utils import DownloadError
from config import YOUTUBE_STRATEGIES


class RetryHandler:
    """Manejador de reintentos con múltiples estrategias para YouTube"""
    
    def __init__(self, max_retries: int = 3):
        self.max_retries = max_retries
    
    def execute_with_retry(
        self, 
        download_func: Callable,
        youtube_url: str,
        **kwargs
    ) -> Any:
        """
        Ejecuta función de descarga con reintentos usando diferentes estrategias.
        
        Args:
            download_func: Función de descarga a ejecutar
            youtube_url: URL de YouTube a descargar
            **kwargs: Argumentos adicionales para la función de descarga
            
        Returns:
            Resultado de la función de descarga
            
        Raises:
            Exception: Si todas las estrategias fallan
        """
        last_error = None
        
        # Intentar con cada estrategia
        for strategy_idx, strategy in enumerate(YOUTUBE_STRATEGIES):
            try:
                print(f"🔄 Intentando estrategia {strategy_idx + 1}/{len(YOUTUBE_STRATEGIES)}: {strategy['name']}")
                
                return download_func(
                    youtube_url, 
                    strategy=strategy,
                    **kwargs
                )
                
            except DownloadError as e:
                error_msg = str(e).lower()
                
                # Si es error 403 o bot detection, intentar siguiente estrategia
                if '403' in error_msg or 'bot' in error_msg or 'forbidden' in error_msg:
                    last_error = e
                    print(f"⚠️ Estrategia {strategy['name']} falló con error 403/bot")
                    
                    if strategy_idx < len(YOUTUBE_STRATEGIES) - 1:
                        print(f"⏳ Esperando 2 segundos antes de siguiente intento...")
                        time.sleep(2)  # Pequeña pausa entre intentos
                        continue
                    else:
                        raise Exception(
                            f"Todas las estrategias fallaron. YouTube bloqueó la descarga. "
                            f"Último error: {str(e)}"
                        )
                else:
                    # Otro tipo de error, no reintentar
                    print(f"❌ Error no relacionado con bot detection: {str(e)}")
                    raise
            
            except Exception as e:
                # Error inesperado, no reintentar
                print(f"❌ Error inesperado: {str(e)}")
                raise
        
        # Si llegamos aquí, todas las estrategias fallaron
        if last_error:
            raise last_error
        else:
            raise Exception("Error desconocido en el sistema de reintentos")
