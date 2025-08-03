import Groq from 'groq-sdk';
const groqClient = new Groq({
    apiKey: process.env.GROQ_API_KEY,
})


export async function POST(req: Request) {

    try {

        const body = await req.json();

        console.log('\nLLM Stats:', body.llmStatistics);
        console.log('\nExperiments:', body.experiments);

        // Extract comparative analyses from experiments
        const comparativeAnalyses = body.experiments
            .filter((exp: any) => exp.comparativeAnalysis)
            .map((exp: any, index: number) => ({
                experimentIndex: index + 1,
                prompt: exp.prompt.substring(0, 100) + (exp.prompt.length > 100 ? '...' : ''),
                analysis: exp.comparativeAnalysis
            }));

        const statsAndExperiments = {
            llmCumulativeStats: body.llmStatistics,
            experiments: body.experiments,
            comparativeAnalyses: comparativeAnalyses,
        };


        // Splitting sentences for easier readability
        const personality = "You are a tool that generates helpful insights for users regarding their data, searching for patterns that the user may not notice at first sight while being concise and clear. "
        const dataDescription = "The data you will be fed is for an LLM evaluation platform where users input both a prompt and an expected output to assess which model best fits their needs. "
        const bleuRougeInfo = "The BLEU and ROUGE scores will be from 0 to 100 in this context compared to 0 to 1 to represent percentages. ";
        const comparativeAnalysisInfo = "You also have access to individual comparative analyses for each experiment that provide detailed model comparisons and insights. Use these to identify broader patterns across experiments. ";
        const analysisInstructions = "Synthesize insights from both the statistical data AND the comparative analyses to provide comprehensive insights about model performance trends, user patterns, and recommendations. ";
        const accuracyInsurance = "The accuracy of your response is crucial. Please double check any insights you make before you present them. ";
        const units = "response time is measured in milliseconds (ms). ";
        const formatting = "Format your response with clear headings using markdown syntax for better readability. ";

        const systemPrompt = personality + dataDescription + bleuRougeInfo + comparativeAnalysisInfo + analysisInstructions + accuracyInsurance + units + formatting;
        const llmResponse = await groqClient.chat.completions.create({
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: JSON.stringify(statsAndExperiments) },
                    ],
                model: "llama-3.3-70b-versatile", // Using the more powerful model for better analysis
                temperature: 0.3, // Lower temperature for more consistent analysis
            },
        );
        let response = llmResponse.choices[0].message.content;
        response = response ? response.trim() : '';


        return new Response(JSON.stringify({ Analysis: response }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    }
    catch (error) {
        console.error('Error in POST request:', error);
        return new Response(JSON.stringify({ error: error }), { status: 500 });
    }

}