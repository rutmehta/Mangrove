from ollama import chat
from ollama import ChatResponse


def generate_notes_summary(notes):
    response: ChatResponse = chat(model='llama3.2', messages=[
    {
        'role': 'user',
        'content': ('summarize: "' + notes + '"'),
    },
    ])

    return(response['message']['content'])

print(generate_notes_summary("The tide has largely turned against alcohol. Drinking, at least in moderation, was once seen as a harmless—or even healthy—indulgence that could strengthen your heart and even lengthen your lifespan. But in many scientific circles, consuming virtually any amount of alcohol is now seen as toxic. On Jan. 3, outgoing Surgeon General Vivek Murthy released an advisory warning that alcohol consumption raises the risk of at least seven types of cancer. Shortly afterward, a second federal report warned that people who consume more than nine drinks per week have a one in 100 chance of dying from their habit, due to alcohol’s links to a range of health problems. Increasingly, reports like these conclude there is no safe level of drinking. Even moderate consumption—no more than one alcoholic beverage per day for women, and no more than two per day for men—comes with dangers, and the situation snowballs the more a person sips. But alcohol is an ancient and natural beverage, made by fermenting grains, fruits, or vegetables—all of which are part of a balanced diet in their original forms. So what’s so bad about booze, exactly?"))