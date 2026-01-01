create venv :
python -m venv .venv
.venv\Scripts\activate
python.exe -m pip install --upgrade pip
pip install -r .\requirements.txt

migrations cammand:
alembic init alembic
alembic revision --autogenerate -m "initial"

run cammand:
uvicorn main:app --reload --host 0.0.0.0 --port 8000

bcrypt error get time use:
pip uninstall bcrypt passlib -y
pip install bcrypt==4.0.1 passlib[bcrypt]==1.7.4