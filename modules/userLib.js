const msg_init_reg = "Looks like you're new! Let's get you registered. Please begin your replies to the following registration questions with /reply followed by as space (eg: /reply James) \n \n What is your name?"

const ask_name = 'What is your name?'

const ask_status = "Reply with 1 if you're a donor or 2 if you're a recipient"

const ask_status_clarify = "Please enter a valid number. Reply with 1 if you're a donor or 2 if you're a recipient - eg: /reply 1 or /reply 2"

const ask_address = "What is your address?"

const ask_pincode = "What is your pincode? Please enter 6 characters and only digits."

const ask_pincode_clarify = 'Please enter a valid pincode. It must be 6 characters long and only contain digits'

const ask_phone = "What is your phone number? Please enter 12 characters (country code followed by mobile number) and only digits"

const ask_phone_clarify = 'Please enter a valid phone number. It must be 12 characters long (country code followed by mobile number) and only contain digits'

const msg_successful_reg = "Done! You've been added to our registered users!"

const msg_timeout = "Oops, looks like your session timed out! Please send /start to begin again"

module.exports = { msg_init_reg, ask_name, ask_status, ask_status_clarify, ask_address, ask_pincode, ask_pincode_clarify, ask_phone, ask_phone_clarify, msg_successful_reg, msg_timeout };