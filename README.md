# Tinder Hack

Simple Tinder web client with new resources free. Open web client here [https://tinder-hack.herokuapp.com/](https://tinder-hack.herokuapp.com/)

## To use

- Open your [Tinder Web](https://tinder.com/) with inspector openned `cmd + i` to Mac or `F12` to Windows;
- Find in network tab the request `core`;
- Generate a `cron string` of this request;
- Past in first textarea to initialize the process;

![example](https://raw.githubusercontent.com/welingtonsampaio/tinder-hack/master/assets/images/example.png)


## Run server

```bash
$ yarn install
$ yarn start
```

Open in your browser [http://localhost:6660/](http://localhost:6660/)

## Navigation

Use keyboards to fast navigations:

- `UP` - show previous user details
- `DOWN` - show next user details
- `LEFT` - pass user, dislike on tinder
- `RIGHT` - like user, like on tinder
- `R` - reload list of users
