## Getting Started

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/sellscalehood.git
   cd sellscalehood
   ```

2. Build the Docker images:
   ```
   docker-compose build
   ```

3. Start the application:
   ```
   docker-compose up -d
   ```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

Note: Step 2 is typically only necessary the first time you set up the project or after making changes to the Dockerfiles or dependencies. For subsequent runs, you can usually just use `docker-compose up -d`.

## Stopping the Application

To stop the application and remove the containers:

```
docker-compose down
```

To stop the application and remove the containers, volumes, and images:

```
docker-compose down -v --rmi all
```

## Rebuilding After Changes

If you make changes to the code or dependencies, you may need to rebuild the Docker images:

```
docker-compose build
docker-compose up -d
```