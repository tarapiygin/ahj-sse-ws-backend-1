const uuid = require('uuid');
const data = require('./data.json');

module.exports = class EventManager {
  constructor() {
    this.events = [];
    this.maxSize = 50;
    this.done = false;
    this.generateNewEventLisnteners = [];
    this.registerEvents();
  }

  static generateEvent() {
    let eventList;
    let event;
    const d = Math.random();
    if (d < 0.5) {
      event = 'action';
      eventList = data.action;
    } else if (d < 0.9) {
      event = 'freekick';
      eventList = data.freekick;
    } else {
      event = 'goal';
      eventList = data.goal;
    }
    const description = eventList[Math.floor(Math.random() * eventList.length)];
    const date = Date.now();
    const id = uuid.v4();
    return {
      id,
      event,
      data: JSON.stringify({
        id,
        description,
        date,
      }),
    };
  }

  addGenerateNewEventLisntener(callback) {
    this.generateNewEventLisnteners.push(callback);
  }

  onGenerateNewEvent() {
    let eventObj;
    if (this.events.length === this.maxSize) {
      this.done = true;
      const id = uuid.v4();
      eventObj = {
        id,
        event: 'action',
        data: JSON.stringify({
          id,
          description: 'Конец игры',
          date: Date.now(),
        }),
      };
    } else eventObj = EventManager.generateEvent();
    this.events.push(eventObj);
    this.generateNewEventLisnteners.forEach((o) => o.call(null, eventObj));
  }

  getEventsById(id = null) {
    let index = 0;
    if (id !== null) index = this.events.findIndex((event) => event.id === id);
    return this.events.slice(index);
  }

  registerEvents() {
    const interval = setInterval(() => {
      if (this.done) {
        clearInterval(interval);
      } else this.onGenerateNewEvent();
    }, 5000);
  }
};
