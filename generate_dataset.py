import random
import json
# Defining lists of possible values for different task attributes
task_names = [
    "Prepare project report", "Read research paper", "Complete programming assignment", 
    "Daily workout", "Attend team meeting", "Write blog post", "Plan vacation", 
    "Prepare presentation", "Grocery shopping", "Clean the house", "Study for exam", 
    "Finish reading book", "Walk the dog", "Prepare dinner", "Do laundry",
    "Review quarterly goals", "Catch up on emails", "Respond to client queries", 
    "Organize files", "Backup important data", "Prepare breakfast", "Do yoga session",
    "Call a friend", "Write thank you notes", "Research new technology trends",
    "Water the plants", "Review job applications", "Practice guitar", "Update resume",
    "Volunteer for social cause", "Plan weekend activities", "Organize workspace",
    "Read self-help book", "Research healthy recipes", "Declutter living space",
    "Practice meditation", "Review bank statements", "Plan birthday party",
    "Attend career fair", "Write diary entry", "Research investment options",
    "Create monthly budget", "Plan home renovation", "Review insurance policy",
    "Research higher education options", "Plan social gathering", "Organize wardrobe",
    "Read motivational quotes", "Research vacation destinations", "Plan date night",
    "Research new hobby ideas", "Organize digital files", "Read philosophy book",
    "Research local events", "Plan family gathering", "Organize bookshelf",
    "Read scientific articles", "Research productivity tips", "Plan surprise gift",
    "Research time management techniques", "Organize photo album", "Read poetry book",
    "Research stress management strategies", "Plan weekend getaway", "Organize garage",
    "Read fiction book", "Research communication skills", "Plan adventure trip",
    "Research public speaking tips", "Organize attic", "Read mystery novel",
    "Research negotiation strategies", "Plan road trip", "Organize basement",
    "Read fantasy book", "Research conflict resolution techniques", "Plan beach vacation",
    "Research networking strategies", "Organize garden", "Read romance novel",
    "Research leadership skills", "Plan camping trip", "Organize shed",
    "Read thriller book", "Research teamwork skills", "Plan hiking trip",
    # write some sports tasks
    "Play basketball", "Play football", "Play cricket", "Play tennis", "Play badminton",
    "Play volleyball", "Play table tennis", "Play golf", "Play soccer", "Play baseball",
    "Play rugby", "Play hockey", "Play swimming", "Play cycling", "Play running",
    # video games
    "Play Fortnite", "Play PUBG", "Play Call of Duty", "Play Valorant", "Play Apex Legends",
    "Play FIFA", "Play NBA 2K", "Play Rocket League", "Play Overwatch", "Play Rainbow Six Siege",
    # movies
    "Watch action movie", "Watch comedy movie", "Watch drama movie", "Watch horror movie",
    "Watch thriller movie", "Watch romance movie", "Watch science fiction movie",
    # TV shows
    "Watch sitcom", "Watch drama series", "Watch reality show", "Watch talk show",
    # music
    "Listen to pop music", "Listen to rock music", "Listen to hip hop music",
    # books
    "Read science fiction book", "Read mystery novel", "Read romance novel",
    "Read thriller book", "Read fantasy book", "Read fiction book",
    # cooking
    "Cook pasta", "Cook pizza", "Cook salad", "Cook steak", "Cook soup",
    "Cook sandwich", "Cook burger", "Cook sushi", "Cook tacos", "Cook curry",
    "Cook fried rice", "Cook noodles", "Cook omelette", "Cook pancakes", "Cook waffles",
    # baking
    "Bake cake", "Bake cookies", "Bake bread", "Bake muffins", "Bake cupcakes",
    "Bake brownies", "Bake pie", "Bake tart", "Bake scones", "Bake croissants",
    "Bake donuts", "Bake macarons", "Bake cheesecake", "Bake biscuits", "Bake rolls",
    # gardening
    "Plant flowers", "Plant vegetables", "Plant herbs", "Plant trees", "Plant shrubs",
    # painting
    "Paint landscape", "Paint portrait", "Paint abstract art", "Paint still life",
]

task_categories = ["Work", "Study", "Exercise", "Personal", "Chores", "Hobby", "Social", "Health", "Finance", "Travel", "Other"]
priorities = ["High", "Medium", "Low"]
estimated_times = ["1 hour", "2 hours", "3 hours", "4 hours", "30 minutes", "1.5 hours", "2.5 hours", "3.5 hours", "4.5 hours", "5 hours", "6 hours", "7 hours", "8 hours"]

# Randomly generating deadlines in more readable format
def random_deadline():
    days = ["Today", "Tomorrow", "Next Monday", "Friday", "Next Week", "End of Month"]
    times = ["12 PM", "3 PM", "5 PM", "8 AM", "10 AM", "6 PM", "9 AM", "2 PM", "4 PM", "7 PM",
            "11 AM", "1 PM", "9 PM", "10 PM", "11 PM", "8 PM", "7 AM", "6 AM", "5 AM", "4 AM",
            "3 AM", "2 AM", "1 AM", "12 AM"]
    return f"{random.choice(days)} {random.choice(times)}"

# Function to generate a random task input entry
def generate_task_entry():
    return {
        "task_name": random.choice(task_names),
        "task_category": random.choice(task_categories),
        "deadline": random_deadline(),
        "priority": random.choice(priorities),
        "estimated_completion_time": random.choice(estimated_times)
    }

# Creating a dataset with 3000 entries
large_task_input_dataset = [generate_task_entry() for _ in range(6000)]

# Saving the dataset to a JSON file
large_dataset_path = "/Users/sushantravva/Desktop/Smart-Task-Scheduler/large_task_input_dataset_6000.json"
with open(large_dataset_path, 'w') as file:
    json.dump(large_task_input_dataset, file, indent=4)

large_dataset_path