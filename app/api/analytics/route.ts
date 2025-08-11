import Groq from 'groq-sdk';
const groqClient = new Groq({
    apiKey: process.env.GROQ_API_KEY,
})


export async function POST(req: Request) {

    try {

        const body = await req.json();

        console.log('\nLLM Stats:', body.llmStatistics);
        console.log('\nExperiments:', body.experiments);

        // Extract condensed summaries from experiments for efficient token usage
        const condensedAnalyses = body.experiments
            .filter((exp: any) => exp.condensedSummary)
            .map((exp: any, index: number) => ({
                experimentIndex: index + 1,
                prompt: exp.prompt.substring(0, 80) + (exp.prompt.length > 80 ? '...' : ''),
                condensedSummary: exp.condensedSummary
            }));

        const statsAndExperiments = {
            llmCumulativeStats: body.llmStatistics,
            /*experiments: body.experiments.map((exp: any) => ({
                prompt: exp.prompt.substring(0, 80) + (exp.prompt.length > 80 ? '...' : ''),
                expected: exp.expected.substring(0, 80) + (exp.expected.length > 80 ? '...' : ''),
                // Only include key metrics to save tokens
                modelStats: Object.keys(exp.responsesAndEvaluations || {}).map(model => ({
                    model: model,
                    similarity: (exp.responsesAndEvaluations[model]?.evaluation?.similarity * 100).toFixed(1) + '%',
                    responseTime: exp.responsesAndEvaluations[model]?.evaluation?.responseTime?.toFixed(0) + 'ms'
                }))
            })),*/
            condensedAnalyses: condensedAnalyses,
        };


        // Splitting sentences for easier readability
        const personality = "You are a tool that generates helpful insights for users regarding their data, searching for patterns that the user may not notice at first sight while being concise and clear. "
        const dataDescription = "The data you will be fed is for an LLM evaluation platform where users input both a prompt and an expected output to assess which model best fits their needs. "
        const bleuRougeInfo = "The BLEU and ROUGE scores will be from 0 to 100 in this context compared to 0 to 1 to represent percentages. ";
        const condensedAnalysisInfo = "You have access to condensed summaries for each experiment that provide key findings in a brief format to help identify broader patterns across experiments efficiently. ";
        const analysisInstructions = "Synthesize insights from both the statistical data AND the condensed summaries to provide comprehensive insights about model performance trends, user patterns, and recommendations. Look for common themes across the condensed summaries. ";
        const accuracyInsurance = "The accuracy of your response is crucial. Please double check any insights you make before you present them. ";
        const units = "response time is measured in milliseconds (ms). ";
        const formatting = "Format your response with clear headings using markdown syntax for better readability. ";

        const systemPrompt = personality + dataDescription + bleuRougeInfo + condensedAnalysisInfo + analysisInstructions + accuracyInsurance + units + formatting;
        
        
        
        const llmResponse = await groqClient.chat.completions.create({
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: JSON.stringify(statsAndExperiments) },
                    ],
                model: "llama-3.3-70b-versatile",
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