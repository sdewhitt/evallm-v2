import Groq from 'groq-sdk';
import stringSimilarity from 'string-similarity';
import { nGram } from 'n-gram';

//import mongoose from 'mongoose'; // Bsyxb2yLPLpXd24P
//import Experiment from '@/app/models/Experiment';
import { UpdateFilter, Document } from 'mongodb';
import client from '@/app/db/mongo';

const groqClient = new Groq({
    apiKey: process.env.GROQ_API_KEY,
})

async function generateComparativeAnalysis(
    prompt: string, 
    expected: string, 
    llmResponseList: { [key: string]: any }
): Promise<string> {
    try {
        // Prepare the analysis prompt
        const models = Object.keys(llmResponseList);
        let responseComparison = '';
        
        models.forEach(model => {
            const response = llmResponseList[model].response;
            const evaluation = llmResponseList[model].evaluation;
            responseComparison += `**${model}:**\n`;
            responseComparison += `Response: "${response}"\n`;
            responseComparison += `Similarity to Expected: ${(evaluation.similarity * 100).toFixed(1)}%\n`;
            responseComparison += `BLEU Score: ${evaluation.bleu.toFixed(3)}\n`;
            responseComparison += `Response Time: ${evaluation.responseTime.toFixed(0)}ms\n\n`;
        });

        const analysisPrompt = `As an AI evaluation expert, analyze the following scenario:

**Original Prompt:** "${prompt}"
**Expected Output:** "${expected}"

**Model Responses and Metrics:**
${responseComparison}

Provide a comprehensive comparative analysis that includes:

1. **Response Quality Comparison:** Which model(s) provided the most accurate and relevant responses?
2. **Performance Analysis:** Compare response times and overall efficiency
3. **Similarity Assessment:** Analyze how well each model matched the expected output
4. **Strengths and Weaknesses:** Identify what each model did well and where they fell short
5. **Best Use Cases:** Recommend which model might be best for similar prompts
6. **Overall Ranking:** Rank the models based on their performance for this specific task

Be objective, detailed, and provide specific examples from the responses. Format your analysis with clear sections and bullet points where appropriate.`;

        const analysisResponse = await groqClient.chat.completions.create({
            messages: [
                { 
                    role: "system", 
                    content: "You are an expert AI model evaluator. Provide detailed, objective analysis comparing AI model performances. Use markdown formatting for better readability." 
                },
                { role: "user", content: analysisPrompt }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.3, // Lower temperature for more consistent analysis
        });

        return analysisResponse.choices[0].message.content || "Analysis could not be generated.";
    } catch (error) {
        console.error('Error generating comparative analysis:', error);
        return "Error: Could not generate comparative analysis.";
    }
}

export async function POST(req: Request) {
    
    try {
        const body = await req.json();

        console.log('\nUser:', body.email);
        console.log('Query:', body.message);
        console.log('Expected Output:', body.expectedOutput);
        


        // Call function to retrieve output for each LLM
        const LLMs = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'gemma2-9b-it'];
        const llmResponseList: { [key: string]: any } = {};

        const responses = await Promise.all(
            LLMs.map(model => llmResponseEvaluation(model, body.message, body.expectedOutput))
        );

        LLMs.forEach((model, index) => {
            llmResponseList[model] = responses[index];
        });


        //console.log('\n\nLLM Response List:', llmResponseList);

        // Generate comparative analysis
        const comparativeAnalysis = await generateComparativeAnalysis(
            body.message, 
            body.expectedOutput, 
            llmResponseList
        );

        await storeData(body.email, body.message, body.expectedOutput, llmResponseList, comparativeAnalysis);

        const curPromptData = {
            prompt: body.message,
            expected: body.expectedOutput,
            responsesAndEvaluations: llmResponseList,
            comparativeAnalysis: comparativeAnalysis,
        }

        return new Response(JSON.stringify({ experiment: curPromptData }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    }
    catch (error) {
        console.error('Error in POST request:', error);
        return new Response(JSON.stringify({ error: error }), { status: 500 });
    }
}



async function llmResponseEvaluation(model: string, userPrompt: string, expectedOutput: string) {
    const systemPrompt = "You are an LLM who answers questions CONCISELY. Your response WILL be compared to an expected output that you do NOT have access to, so do not add fluff.";

    const start = performance.now();

    const llmResponse = await groqClient.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }, // Add the new user prompt
                ],
            model: model, //response_format: {"type" : "json_object"}
            
        },
    );


    // Track response time
    const responseTime = performance.now() - start;
    console.log(`\nResponse time for ${model}: ${responseTime} ms`);

    let response = llmResponse.choices[0].message.content;
    response = response ? response.trim() : '';

    console.log(`${model} Chat completion:`, response);

    //return response;

    // List of evaluation metrics: (inspired by G-Eval)
    // 1. Response time
    // 2. Exact match/Accuracy
    // 3. Similarity, measured by cosine similarity
    // 4. BLEU score
    // 5. ROUGE score
    // 6. Perplexity: TODO

    // Calculate cosine similarity
    const cosineSimilarity = stringSimilarity.compareTwoStrings(expectedOutput, response);
    console.log(`Cosine similarity: ${cosineSimilarity}`);

    const bleuScore = calculateBleu(expectedOutput, response);
    console.log(`BLEU: ${bleuScore}`);


    const nGrams = 3;
    const rougeScores = calculateRougeN(expectedOutput, response, nGrams);
    console.log(`ROUGE 1-${nGrams}: ${rougeScores}`);

    const evaluation = {
        "responseTime": responseTime,
        "exactMatch": expectedOutput === response,
        "similarity": cosineSimilarity,
        "bleu": bleuScore,
        "rouge": rougeScores,
        "perplexity": 0,
    };


   

    return {"response": response, "evaluation": evaluation};
}

// Function to calculate BLEU score
function calculateBleu(reference: string, candidate: string): number {
    const referenceTokens = reference.split(' ');
    const candidateTokens = candidate.split(' ');

    const n = 4; // bigram -> 4-gram
    let precision = 0;
    for (let i = 2; i <= n; i++) {
        const referenceNGram = nGram(i)(referenceTokens).map(ngram => [ngram]);
        const candidateNGram = nGram(i)(candidateTokens).map(ngram => [ngram]);

        const nGramPrecision = calculatePrecision(referenceNGram, candidateNGram);
        precision += nGramPrecision;
    }

    precision /= n;

    const brevityPenalty = Math.min(1, Math.exp(1 - referenceTokens.length / candidateTokens.length));

    return brevityPenalty * precision;
}

function calculatePrecision(referenceNgrams: string[][], candidateNgrams: string[][]): number {
    const referenceNgramSet = new Set(referenceNgrams.map(ngram => ngram.join(' ')));
    const candidateNgramSet = new Set(candidateNgrams.map(ngram => ngram.join(' ')));

    const matchingNgrams = [...candidateNgramSet].filter(ngram => referenceNgramSet.has(ngram)).length;

    return matchingNgrams / candidateNgrams.length;
}


function getNGrams(tokens: string[], n: number): string[] {
    const nGrams: string[] = [];
    for (let i = 0; i <= tokens.length - n; i++) {
        nGrams.push(tokens.slice(i, i + n).join(' '));
    }
    return nGrams;
}

function calculateRougeN(reference: string, candidate: string, n: number): number[] {
    const referenceTokens = reference.split(' ');
    const candidateTokens = candidate.split(' ');


    const f1Scores = [];
    for (let i = 1; i <= n; i++) {
        const referenceNGrams = getNGrams(referenceTokens, i);
        const candidateNGrams = getNGrams(candidateTokens, i);
    
        const referenceNGramSet = new Set(referenceNGrams);
        const candidateNGramSet = new Set(candidateNGrams);
    
        const matchingNGrams = [...candidateNGramSet].filter(ngram => referenceNGramSet.has(ngram)).length;
    
        const precision = matchingNGrams / candidateNGrams.length;
        const recall = matchingNGrams / referenceNGrams.length;
        const f1Score = (2 * precision * recall) / (precision + recall);
        f1Scores.push(f1Score);
    }

    return f1Scores;
}


async function storeData(user: string, prompt: string, expected: string, llmResponseList: { [key: string]: any }, comparativeAnalysis: string) {
    // Store data in MongoDB

    console.log("Awaiting connection to MongoDB...");
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        const database = client.db('Evallm');
        const collection = database.collection('User Prompts + Evaluations');

        const userDoc = await collection.findOne({username: user});
        const curPromptData = {
            prompt: prompt,
            expected: expected,
            responsesAndEvaluations: llmResponseList,
            comparativeAnalysis: comparativeAnalysis,
        }
        

        console.log("checking for user docs for user: ", user);
        if (userDoc) { // Existing user -> add to existing document

            const update: UpdateFilter<Document> = {
                $push: {prompts: curPromptData as any},
                $set: {lastModified: new Date().toISOString()},
            };
            const result = await collection.updateOne({username: user}, update);
            if (result.modifiedCount > 0) {
                console.log(`Data successfully added to ${user}'s document.`);
            } else {
                console.log(`No changes were made to ${user}'s document.`);
            }
        }
        else { // New user -> new document

            const newUserDoc = {
                username: user,
                prompts: [curPromptData,],
                lastModified: new Date().toISOString(),
            }
            const result = await collection.insertOne(newUserDoc);
            console.log(`New document created for ${user} with ID: ${result.insertedId}`);

        }

    } catch (error) {
        console.log('Error in storing data:', error);
    } finally {
        // Ensures that the client will close when you finish/error
        //await client.close();
    }


}

