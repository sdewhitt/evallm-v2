import { auth } from "@/auth";
import client from '@/app/db/mongo';

export async function GET() {
    try {
        // Get the current session using NextAuth
        const session = await auth();
        
        if (!session?.user?.email) {
            console.log('No session or email found');
            return new Response(JSON.stringify({ error: "Not authenticated" }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const userEmail = session.user.email;
        console.log('\nFetching user data for:', userEmail);

        // Connect to MongoDB
        console.log('Connecting to MongoDB...');
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        console.log('MongoDB connection successful');
        
        const database = client.db('Evallm');
        
        // Load past user data from the 'User Prompts + Evaluations' collection
        const promptCollection = database.collection('User Prompts + Evaluations');
        console.log('Querying for user:', userEmail);
        const userPromptDoc = await promptCollection.findOne({username: userEmail});
        console.log('Query result:', userPromptDoc ? 'Document found' : 'No document found');

        return new Response(JSON.stringify({
            success: true,
            prompts: userPromptDoc !== null ? userPromptDoc.prompts.reverse() : []
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Error fetching user data:', error);
        return new Response(JSON.stringify({ 
            error: error instanceof Error ? error.message : "Unknown error",
            success: false 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
