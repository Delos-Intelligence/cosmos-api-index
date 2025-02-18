import logging

logging.basicConfig(level=logging.INFO)

# Create a logger for your application
logger = logging.getLogger(__name__)

# Disable logging for cosmos.client
cosmos_client_logger = logging.getLogger("cosmos.client")
cosmos_client_logger.setLevel(logging.CRITICAL)
cosmos_client_logger.propagate = False
