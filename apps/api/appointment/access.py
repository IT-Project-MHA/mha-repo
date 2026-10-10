from audit.services import record_view


def record_appointment_view(actor, appointment):
    # Log that someone opened another person's appointment
    # Nothing is logged when the patient opens their own
    return record_view(actor, appointment)


def record_question_view(actor, question):
    # Log that someone opened another person's question
    # Nothing is logged when the patient opens their own
    return record_view(actor, question)