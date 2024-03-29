# Rally

![alt text](https://i.imgur.com/Hk0nzAE.png "Rally Logo")

## Commands

```
!rally help
!rally <game name> <player count> - Initiate rallying of users to start playing a game
!rally_plan <minutes until Rally> <game name> <player count> - Schedule a Rally for the future
!rally_recruit <user1> <user2> <userx...>- DM's a user to join in on a rally you created most recently
!rally_channel - Create a temporary channel for a Rally
```

## TODO

- Specify what channel rally will live in using `rally_admin channel <channel_name>`
- Have invite recommendations
- Spectator reactions
- Creator start rally before all ready
- Delete temporary channel once all users have left
- For rally_plan notify creator if timer runs out and there aren't enough people

## Developing

1. Make sure you have mongo db running locally
1. Create a `.env` file with the following properties

- BOT_TOKEN=<token acquired through discord's developer dashboard>
- ENV=DEV
- MONGO_URI=mongodb://127.0.0.1:27017/rally

1. Clone repo and run `yarn`
1. `yarn dev`
