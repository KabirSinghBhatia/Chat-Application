# Chat Application

It is a simple realtime chat application where users can create and join different chat rooms and communicate with each other.

## Characteristics & Features

1. Made using Node.js, Express.js, SocketIO, Mustache.
2. Realtime communication.
3. Users can create or join different chat rooms.
4. Text messages, image and location can be sent.
5. Profanity filter in text messages.

## Installation

Install the node modules using npm in the application root.

```bash
npm install
```

### Config

By default, the application runs on port `3000` unless specified `process.env.PORT`

## Usage

Run the application using the following command for **Production** environment.

```bash
npm run start
```

Run the application **locally** (nodemon required) using the following command for **Development** environment.

```bash
npm run dev
```

## Documentation

Navigate to the index route in the browser (ex: `http://localhost:$PORT`, where `$PORT` is the configured port depending on your environment).

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
