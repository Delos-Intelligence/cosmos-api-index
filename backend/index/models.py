from pydantic import BaseModel


class IndexCreateModel(BaseModel):
    name: str
    filepaths: list[str]
