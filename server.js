/* eslint-disable no-shadow */
const http = require('http');
const Koa = require('koa');
const { streamEvents } = require('http-event-stream');
const koaBody = require('koa-body');
const cors = require('@koa/cors');
const serve = require('koa-static');
const Router = require('koa-router');
const EventManager = require('./EventManager');

const app = new Koa();
const router = new Router();
const publicPath = ('./public');
const eventManager = new EventManager();
app.use(serve(publicPath));
app.use(cors());
app.use(koaBody({
  urlencoded: true,
  multipart: true,
  json: true,
}));

router.get('/sse', async (ctx) => {
  streamEvents(ctx.req, ctx.res, {
    async fetch(lastEventId) {
      return eventManager.getEventsById(lastEventId);
    },
    stream(sse) {
      setTimeout(() => {
        sse.sendEvent({
          data: JSON.stringify(eventManager.getEventsById()),
          event: 'allEvent',
        });
      });
      eventManager.addGenerateNewEventLisntener(sse.sendEvent);
      return () => { };
    },
  });
  ctx.respond = false; // koa не будет обрабатывать ответ
});

app.use(router.routes()).use(router.allowedMethods());
const port = process.env.PORT || 7070;
http.createServer(app.callback()).listen(port);
module.exports.publicPath = publicPath;
