docker build --build-arg NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api -t next-app .

docker run -p 3000:3000 next-app
docker run -p 3000:3000 next-app
