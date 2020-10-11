# Rally

![alt text](https://i.imgur.com/XirvUpA.png "Rally Logo")

## Commands

```
!rally <game name> <player count> - Initiate rallying of users to start playing a game
!rally_recruit <user> - DM's a user to join in on a rally you created most recently
```

## TODO

- Specify what channel rally will live in using `rally_admin channel <channel_name>`
- Have invite recommendations
- Register yourself for game, get notified everytime someone wants to rally with it `rally_register`

## Developing

1. Make sure you have mongo db running locally
1. Create a `.env` file with the following properties

- BOT_TOKEN=<token acquired through discord's developer dashboard>
- ENV=DEV
- MONGO_URI=mongodb://127.0.0.1:27017

1. Clone repo and run `yarn`
1. `yarn dev`
