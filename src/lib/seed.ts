import type { DB } from "./db";
import { CURRENT_USER_ID } from "./db";

type Seed = {
  name: string; age: number; gender: "women" | "men";
  city: string; college: string; bio: string; interests: string[];
};

const PEOPLE: Seed[] = [
  { name: "Aanya",   age: 21, gender: "women", city: "Delhi",     college: "Miranda House",      bio: "Chai over coffee, always.",                 interests: ["poetry", "chai", "indie music"] },
  { name: "Rohan",   age: 23, gender: "men",   city: "Mumbai",    college: "IIT Bombay",         bio: "Building things that break, then fixing them.", interests: ["coding", "football", "anime"] },
  { name: "Ishita",  age: 20, gender: "women", city: "Bengaluru", college: "Christ University",  bio: "Will judge you by your Spotify Wrapped.",          interests: ["music", "thrifting", "sunsets"] },
  { name: "Kabir",   age: 24, gender: "men",   city: "Delhi",     college: "IIT Delhi",          bio: "Gym at 6, code at 10, Maggi at 2am.",              interests: ["fitness", "coding", "late-night food"] },
  { name: "Meera",   age: 22, gender: "women", city: "Pune",      college: "Symbiosis",          bio: "Law student. I will win the argument.",           interests: ["debating", "books", "cafes"] },
  { name: "Arjun",   age: 21, gender: "men",   city: "Pilani",    college: "BITS Pilani",        bio: "Quizzer, part-time guitarist, full-time overthinker.", interests: ["quizzing", "guitar", "cricket"] },
  { name: "Saanvi",  age: 19, gender: "women", city: "Mumbai",    college: "St. Xavier's",       bio: "Film club president. Ask me for recs.",           interests: ["cinema", "photography", "street food"] },
  { name: "Vihaan",  age: 25, gender: "men",   city: "Hyderabad", college: "IIIT Hyderabad",     bio: "Startup intern by day, stargazer by night.",      interests: ["startups", "astronomy", "trekking"] },
  { name: "Diya",    age: 21, gender: "women", city: "Chennai",   college: "Loyola College",     bio: "Bharatanatyam and bad puns.",                     interests: ["dance", "filter coffee", "memes"] },
  { name: "Aditya",  age: 22, gender: "men",   city: "Manipal",   college: "Manipal Institute",  bio: "Med student who still finds time for football.",   interests: ["football", "medicine", "travel"] },
  { name: "Ananya",  age: 23, gender: "women", city: "Delhi",     college: "LSR",                bio: "Economics nerd with a soft spot for street dogs.", interests: ["economics", "animals", "journaling"] },
  { name: "Reyansh", age: 20, gender: "men",   city: "Kolkata",   college: "Jadavpur University", bio: "Rosogolla defender. Fight me.",                  interests: ["football", "sketching", "food"] },
  { name: "Kiara",   age: 22, gender: "women", city: "Mumbai",    college: "NMIMS",              bio: "Marketing major, meme connoisseur.",              interests: ["marketing", "memes", "brunch"] },
  { name: "Ayaan",   age: 23, gender: "men",   city: "Bengaluru", college: "RV College",         bio: "Will drive to Nandi Hills at 4am for sunrise.",   interests: ["biking", "sunrises", "coding"] },
  { name: "Myra",    age: 20, gender: "women", city: "Jaipur",    college: "Manipal Jaipur",     bio: "Painting my way through engineering.",            interests: ["painting", "design", "folk music"] },
  { name: "Ishaan",  age: 24, gender: "men",   city: "Pune",      college: "COEP",               bio: "Basketball, biryani, and badly timed jokes.",     interests: ["basketball", "biryani", "standup"] },
  { name: "Tara",    age: 21, gender: "women", city: "Ahmedabad", college: "NID",                bio: "Designer. Your font choices concern me.",         interests: ["design", "typography", "pottery"] },
  { name: "Krish",   age: 22, gender: "men",   city: "Chandigarh", college: "Panjab University", bio: "Bhangra at every wedding, no exceptions.",        interests: ["dance", "cricket", "road trips"] },
  { name: "Riya",    age: 23, gender: "women", city: "Hyderabad", college: "ISB",                bio: "MBA, but make it fun.",                           interests: ["finance", "badminton", "k-dramas"] },
  { name: "Dhruv",   age: 21, gender: "men",   city: "Vellore",   college: "VIT",                bio: "Hackathon regular. Sleep is optional.",           interests: ["hackathons", "gaming", "coffee"] },
  { name: "Navya",   age: 20, gender: "women", city: "Delhi",     college: "Hindu College",      bio: "History buff who'll drag you to every monument.", interests: ["history", "heritage walks", "chai"] },
  { name: "Aarav",   age: 25, gender: "men",   city: "Gurugram",  college: "MDI Gurgaon",        bio: "Consultant in training. Excel is my love language.", interests: ["running", "podcasts", "cooking"] },
  { name: "Sara",    age: 22, gender: "women", city: "Goa",       college: "Goa University",     bio: "Beach person, obviously.",                        interests: ["surfing", "marine biology", "reggae"] },
  { name: "Yash",    age: 23, gender: "men",   city: "Indore",    college: "IIM Indore",         bio: "Poha for breakfast, every single day.",           interests: ["food", "chess", "public speaking"] },
  { name: "Avni",    age: 19, gender: "women", city: "Bengaluru", college: "NLSIU",              bio: "Future lawyer, current bookworm.",                interests: ["reading", "moot court", "yoga"] },
  { name: "Rudra",   age: 24, gender: "men",   city: "Dehradun",  college: "UPES",               bio: "Mountains > beaches. Always.",                    interests: ["trekking", "camping", "photography"] },
  { name: "Pari",    age: 21, gender: "women", city: "Lucknow",   college: "Lucknow University", bio: "Tehzeeb and tunday kebabs.",                      interests: ["poetry", "food", "classical music"] },
  { name: "Vivaan",  age: 22, gender: "men",   city: "Mumbai",    college: "VJTI",               bio: "Local train survivor. Marine Drive regular.",     interests: ["robotics", "sea face walks", "football"] },
  { name: "Zoya",    age: 23, gender: "women", city: "Delhi",     college: "Jamia Millia",       bio: "Mass comm student with too many opinions.",       interests: ["journalism", "theatre", "street photography"] },
  { name: "Neil",    age: 20, gender: "men",   city: "Kochi",     college: "CUSAT",              bio: "Backwaters, beats, and beef fry.",                interests: ["music production", "kayaking", "food"] },
];

// These profile ids have ALREADY liked "me", so liking them back creates a match.
export const LIKED_ME = ["p03", "p07", "p11", "p15", "p19", "p22", "p26", "p29"];
// These passed on "me". Liking them must NOT create a match (good for demos/tests).
export const PASSED_ME = ["p05", "p13"];

export const profileId = (i: number) => `p${String(i + 1).padStart(2, "0")}`;

export function seed(db: DB) {
  const now = Date.now();

  const insertProfile = db.prepare(`
    INSERT INTO profiles (id, name, age, photo, bio, city, college, interests)
    VALUES (@id, @name, @age, @photo, @bio, @city, @college, @interests)`);

  const insertSwipe = db.prepare(`
    INSERT INTO swipes (swiper_id, target_id, direction, created_at)
    VALUES (?, ?, ?, ?)`);

  const run = db.transaction(() => {
    // Delete children before parents because of the foreign keys
    db.exec("DELETE FROM matches; DELETE FROM swipes; DELETE FROM profiles;");

    insertProfile.run({
      id: CURRENT_USER_ID, name: "You", age: 22,
      photo: "https://randomuser.me/api/portraits/lego/1.png",
      bio: "", city: "Delhi", college: null, interests: "[]",
    });

    PEOPLE.forEach((p, i) => {
      insertProfile.run({
        id: profileId(i),
        name: p.name,
        age: p.age,
        photo: `https://randomuser.me/api/portraits/${p.gender}/${i + 10}.jpg`,
        bio: p.bio,
        city: p.city,
        college: p.college,
        interests: JSON.stringify(p.interests),
      });
    });

    LIKED_ME.forEach((id) => insertSwipe.run(id, CURRENT_USER_ID, "like", now));
    PASSED_ME.forEach((id) => insertSwipe.run(id, CURRENT_USER_ID, "pass", now));
  });

  run();
  return { profiles: PEOPLE.length, likedMe: LIKED_ME.length };
}