import sys
import asyncio
import selectors
from pathlib import Path

# Add project root to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

import uvicorn
from uvicorn.config import Config
from uvicorn.server import Server
from backend.app.core.config import settings


def main():
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
        loop = asyncio.SelectorEventLoop(selectors.SelectSelector())
        asyncio.set_event_loop(loop)

        config = Config(
            "backend.app.main:app",
            host=settings.SERVER_HOST,
            port=settings.SERVER_PORT,
            reload=False,
        )
        # Ensure Uvicorn uses the Windows SelectorEventLoop for async psycopg3 compatibility
        config.get_loop_factory = lambda: (lambda: loop)
        server = Server(config)
        loop.run_until_complete(server.serve())
    else:
        uvicorn.run(
            "backend.app.main:app",
            host=settings.SERVER_HOST,
            port=settings.SERVER_PORT,
            reload=False,
        )


if __name__ == "__main__":
    main()
