import { redis } from "./src/lib/upstash";

async function checkGameTheorySkill() {
    const userId = "up_255001";
    const key = `skills:${userId}`;
    const challenges = await redis.get<any[]>(key) || [];
    
    console.log(`Checking skills for user: ${userId}`);
    const results = challenges.filter(c => 
        (c.title && c.title.toLowerCase().includes("game theory")) || 
        (c.role && c.role.toLowerCase().includes("game theory"))
    );

    if (results.length > 0) {
        console.log("MATCHES FOUND:");
        console.log(JSON.stringify(results, null, 2));
    } else {
        console.log("No skills related to 'game theory' found.");
        console.log("CURRENT SKILLS:");
        challenges.forEach(c => console.log(`- ${c.role}: ${c.title}`));
    }
}

checkGameTheorySkill();
