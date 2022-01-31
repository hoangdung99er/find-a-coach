export default {
  registerCoach(context, data) {
    const userId = context.rootGetters.userId;
    const coach = {
      firstName: data.first,
      lastName: data.last,
      description: data.desc,
      hourlyRate: data.rate,
      areas: data.areas,
    };

    const token = context.rootGetters.token;

    fetch(
      `https://vue-basic-6526b-default-rtdb.asia-southeast1.firebasedatabase.app/coaches/${userId}.json?auth=${token}`,
      {
        method: 'PUT',
        body: JSON.stringify(coach),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error('Something wrong!');
        }
        return response.json();
      })
      .then((data) => {
        context.commit('registerCoach', {
          ...data,
          id: userId,
        });
      })
      .catch((err) => {
        console.log(err.message);
      });
  },
  async loadCoaches(context, payload) {
    if (!payload.forceRefresh && !context.getters.shouldUpdate) {
      return;
    }

    const response = await fetch(
      `https://vue-basic-6526b-default-rtdb.asia-southeast1.firebasedatabase.app/coaches.json`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch');
    }

    const userId = context.rootGetters.userId;
    const coaches = [];
    for (const key in data) {
      const coach = {
        id: userId,
        firstName: data[key].firstName,
        lastName: data[key].lastName,
        description: data[key].description,
        hourlyRate: data[key].hourlyRate,
        areas: data[key].areas,
      };
      coaches.push(coach);
    }
    context.commit('setCoaches', coaches);
    context.commit('setFetchTimestamp');
  },
};
