FROM node:10.1
WORKDIR /app
COPY . .
RUN npm install
ENTRYPOINT ["npm", "run"]
CMD ["start:production"]
EXPOSE 7323