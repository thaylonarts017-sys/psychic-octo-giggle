import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export default async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { messages, userName } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "No messages provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `Voce e a Vexa, uma assistente de inteligencia artificial profissional, inteligente e amigavel. O nome do usuario e ${userName || "Amigo"}.

Suas capacidades:
- Responder qualquer pergunta sobre qualquer assunto
- Resolver problemas de matematica, fisica, quimica, biologia, historia, geografia, programacao e qualquer outra materia
- Explicar conceitos de forma clara e didatica
- Ajudar com tarefas, trabalhos e projetos
- Analisar textos, imagens e arquivos
- Dar conselhos e sugestoes
- Conversar de forma natural e fluida

Regras:
- Sempre responda em portugues brasileiro
- Seja concisa mas completa
- Use formatacao markdown quando apropriado (negrito, listas, codigo)
- Seja amigavel e profissional
- Para problemas matematicos, mostre o passo a passo da resolucao
- Se nao souber algo, admita honestamente`;

    const anthropicMessages = messages.map(
      (m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })
    );

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: systemPrompt,
      messages: anthropicMessages,
    });

    const reply =
      response.content[0].type === "text" ? response.content[0].text : "";

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Chat error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: "Failed to process request", details: message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
