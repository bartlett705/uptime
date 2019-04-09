FROM node:10.15.3
WORKDIR /app
COPY . .
RUN uptime
RUN npm install
ENTRYPOINT ["npm", "run"]
CMD ["start:production"]
EXPOSE 7323