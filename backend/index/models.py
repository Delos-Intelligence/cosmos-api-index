from typing import IO

from pydantic import BaseModel


class IndexCreateModel(BaseModel):
    name: str
    fileobjects: list[tuple[str, tuple[str, IO[bytes]]]] | None = None

    class Config:
        arbitrary_types_allowed = True
