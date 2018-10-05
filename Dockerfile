FROM node:10

# Install cron
RUN apt-get update && apt-get -y install cron

# Set the working directory
WORKDIR /app

# Copy the current directory contents into the container at /app
ADD . /app

RUN ls -l
RUN whoami

# Install any needed packages
RUN npm install --production


# CRON
# Give execution rights on the cron job
RUN chmod 0644 /app/email-cron
# Apply cron job
RUN crontab /app/email-cron

# Make port 80 (http) available to the world outside this container
EXPOSE 80

# Define environment variables
ENV PORT 80

# Run things when the container launches
#CMD ["sh", "-c", "ls -l /app && whoami && /app/start.sh"]
CMD ["sh", "-c", "./start.sh"]
