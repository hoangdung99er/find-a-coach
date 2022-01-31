let timer;

export default {
  async login(context, payload) {
    return context.dispatch('auth', {
      ...payload,
      mode: 'login',
    });
  },
  async signup(context, payload) {
    return context.dispatch('auth', {
      ...payload,
      mode: 'signup',
    });
  },
  logout(context) {
    context.commit('setUser', {
      token: null,
      userId: null,
    });

    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (token && userId) {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('tokenExpiration');

      clearTimeout(timer);
    }
  },
  async auth(context, payload) {
    const mode = payload.mode;
    let url =
      'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyBLpXJmRiiKn9lGgHU7_U_A-Faz28BQemw';

    if (mode === 'login') {
      url =
        'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyBLpXJmRiiKn9lGgHU7_U_A-Faz28BQemw';
    }

    const response = await fetch(url, {
      method: 'post',
      body: JSON.stringify({
        email: payload.email,
        password: payload.password,
        returnSecureToken: true,
      }),
      headers: {
        'COntent-Type': 'application/json',
      },
    });
    const responseData = await response.json();
    if (!response.ok) {
      if (responseData.error.message === 'EMAIL_EXISTS') {
        throw new Error('Email already exists');
      }
      if (
        responseData.error.message === 'EMAIL_NOT_FOUND' ||
        responseData.error.message === 'INVALID_PASSWORD'
      ) {
        throw new Error('Email or password is invalid, try again.');
      }
      if (responseData.error.message === 'USER_DISABLED') {
        throw new Error('User no longer available.');
      }
      throw new Error('Failed to authenticate');
    }

    const expiresIn = +responseData.expiresIn * 1000;
    const expirationDate = new Date().getTime() + expiresIn;

    localStorage.setItem('token', responseData.idToken);
    localStorage.setItem('userId', responseData.localId);
    localStorage.setItem('tokenExpiration', expirationDate);

    timer = setTimeout(function () {
      context.dispatch('autoLogout');
    }, expiresIn);

    context.commit('setUser', {
      token: responseData.idToken,
      userId: responseData.localId,
    });
  },
  autoLogin(context) {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const tokenExpiration = localStorage.getItem('tokenExpiration');

    const exipiresIn = +tokenExpiration - new Date().getTime();

    if (exipiresIn < 0) {
      return;
    }

    setTimeout(function () {
      context.dispatch('autoLogout');
    }, exipiresIn);

    if (token && userId) {
      context.commit('setUser', {
        token,
        userId,
      });
    }
  },
  autoLogout(context) {
    context.dispatch('logout');
    context.commit('didLogout');
  },
};
