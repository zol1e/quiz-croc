# Quiz-croc AI quiz application

## Development

Run the dev server:

```shellscript
npm run dev
```

## Deployment

First, build your app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
```

## Docker build and run

Docker image build:

```sh
docker build -f Dockerfile -t quizcroc:latest .
```

Docker run:

```sh
docker run -p 3000:3000 -e AI_API_KEY=<Your Gemini AI API KEY> quizcroc:latest
```
