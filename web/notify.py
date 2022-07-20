from flask import current_app
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException


class TwilioSMS(Client):
    """
    Twilio SMS API client
    """
    
    def __init__(self, account_sid, auth_token, source_number):
        super(TwilioSMS, self).__init__(account_sid, auth_token)
        self._source_number = source_number

    def send_sms(self, destination_number, sms_message):
        # Send an SMS to the specified number

        try:

            message = self.messages.create(
                from_=self._source_number,
                body=sms_message,
                to=destination_number
            )
            return message.sid

        except TwilioRestException as e:
            logger.exception(f"Failed to send SMS ({e})")
            return None


def sms_notify_default(message):
    # send an SMS to the default contact
    
    notification = TwilioSMS(
        current_app.config["TWILIO_ACCOUNT_SID"],
        current_app.config["TWILIO_AUTH_TOKEN"],
        current_app.config["TWILIO_SOURCE_NUMBER"]
    )

    # send a notification SMS to the destination number
    pid = notification.send_sms(
        current_app.config["SMS_NOTIFICATION_DEST"],
        message
    )

    return pid is not None
