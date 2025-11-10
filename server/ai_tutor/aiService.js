class AITutorService {
  async processQuery(studentId, message, type = 'text') {
    try {
      // Generate educational response
      const aiResponse = this.generateEducationalResponse(message);

      return {
        response: aiResponse,
        conversationId: 'temp-' + Date.now()
      };
    } catch (error) {
      console.error('AI Tutor Service Error:', error);
      throw new Error('Failed to process AI query');
    }
  }

  getSystemPrompt() {
    return `You are an intelligent AI tutor for an educational platform. Your role is to:

1. Provide clear, educational explanations suitable for students
2. Break down complex concepts into simple, understandable parts
3. Use examples and analogies to help students learn
4. Encourage critical thinking with follow-up questions
5. Adapt your language to the student's level of understanding
6. Be patient, supportive, and encouraging
7. Focus on teaching concepts rather than just giving answers
8. Provide step-by-step solutions for problems
9. Suggest additional resources or practice when appropriate
10. Support both English and Hindi languages

Guidelines:
- Always explain the "why" behind concepts
- Use real-world examples when possible
- Break complex problems into smaller steps
- Encourage students to think through problems
- Be concise but thorough
- Use formatting like bullet points and numbered lists for clarity
- If you don't know something, admit it and suggest how to find the answer

Remember: You're not just answering questions, you're helping students learn and understand.`;
  }

  generateEducationalResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Quadratic equations
    if (lowerMessage.includes('quadratic equation')) {
      return `# Quadratic Equations

A **quadratic equation** is a polynomial equation of degree 2, which means the highest power of the variable is 2.

## Standard Form:
**ax² + bx + c = 0**

Where:
- a, b, c are constants (a ≠ 0)
- x is the variable

## Examples:
- x² + 5x + 6 = 0
- 2x² - 3x + 1 = 0
- x² - 4 = 0

## Methods to Solve:

### 1. Factoring Method
Example: x² + 5x + 6 = 0
- Factor: (x + 2)(x + 3) = 0
- Solutions: x = -2 or x = -3

### 2. Quadratic Formula
**x = (-b ± √(b² - 4ac)) / 2a**

### 3. Completing the Square
Rewrite the equation in the form (x + p)² = q

## Real-world Applications:
- Projectile motion
- Area optimization problems
- Profit/loss calculations

Would you like me to solve a specific quadratic equation or explain any of these methods in detail?`;
    }
    
    // Photosynthesis
    if (lowerMessage.includes('photosynthesis')) {
      return `# Photosynthesis

**Photosynthesis** is the process by which plants make their own food using sunlight, water, and carbon dioxide.

## Chemical Equation:
**6CO₂ + 6H₂O + Light Energy → C₆H₁₂O₆ + 6O₂**

## What's Needed:
- **Carbon dioxide (CO₂)** - from air through stomata
- **Water (H₂O)** - absorbed by roots
- **Sunlight** - captured by chlorophyll
- **Chlorophyll** - green pigment in leaves

## What's Produced:
- **Glucose (C₆H₁₂O₆)** - food for the plant
- **Oxygen (O₂)** - released into air

## Two Main Stages:

### 1. Light Reactions (in thylakoids)
- Chlorophyll absorbs light energy
- Water molecules split
- Oxygen is released
- Energy is stored in ATP and NADPH

### 2. Dark Reactions/Calvin Cycle (in stroma)
- CO₂ is fixed into glucose
- Uses ATP and NADPH from light reactions

## Importance:
- Produces oxygen we breathe
- Forms base of food chains
- Removes CO₂ from atmosphere

Would you like to know more about any specific part of photosynthesis?`;
    }
    
    // Newton's laws
    if (lowerMessage.includes('newton') && lowerMessage.includes('law')) {
      return `# Newton's Laws of Motion

## Newton's First Law (Law of Inertia)
**"An object at rest stays at rest, and an object in motion stays in motion, unless acted upon by an external force."**

### Examples:
- A book on a table stays there until you pick it up
- A moving car continues moving until brakes are applied
- Passengers jerk forward when a car suddenly stops

## Newton's Second Law (F = ma)
**"The acceleration of an object is directly proportional to the net force acting on it and inversely proportional to its mass."**

### Formula: F = ma
- F = Force (Newtons)
- m = mass (kg)
- a = acceleration (m/s²)

### Examples:
- Pushing a heavy box requires more force
- Same force produces more acceleration on lighter objects

## Newton's Third Law (Action-Reaction)
**"For every action, there is an equal and opposite reaction."**

### Examples:
- Walking: you push ground backward, ground pushes you forward
- Rocket propulsion: gases pushed down, rocket pushed up
- Swimming: push water backward, water pushes you forward

## Real-world Applications:
- Car safety (seatbelts, airbags)
- Sports (throwing, jumping)
- Space travel
- Engineering design

Which law would you like me to explain in more detail?`;
    }
    
    // General math help
    if (lowerMessage.includes('algebra') || lowerMessage.includes('equation') || lowerMessage.includes('solve')) {
      return `# Algebra Help

I'd be happy to help you with algebra! Here are some common topics:

## Linear Equations
- Form: ax + b = c
- Example: 2x + 5 = 11 → x = 3

## Quadratic Equations
- Form: ax² + bx + c = 0
- Methods: factoring, quadratic formula, completing square

## Systems of Equations
- Solving multiple equations simultaneously
- Methods: substitution, elimination

## Inequalities
- Similar to equations but with <, >, ≤, ≥

## Functions
- Relationships between variables
- f(x) notation

**Please share your specific algebra problem, and I'll walk you through the solution step by step!**

What type of algebra problem are you working on?`;
    }
    
    // Default educational response
    return `# Hello! I'm your AI Tutor 🎓

I'm here to help you learn and understand various subjects. I can assist with:

## 📚 Subjects I Cover:
- **Mathematics** - Algebra, Geometry, Calculus, Statistics
- **Science** - Physics, Chemistry, Biology
- **English** - Grammar, Writing, Literature
- **History** - World history, Events, Civilizations
- **Geography** - Countries, Climate, Physical features

## 🎯 How I Help:
- **Step-by-step explanations** for complex problems
- **Real-world examples** to make concepts clear
- **Practice problems** with detailed solutions
- **Study tips** and learning strategies

## 💡 Tips for Better Learning:
1. Ask specific questions
2. Let me know your grade level
3. Tell me what part you're struggling with
4. Ask for examples if needed

**Example questions you can ask:**
- "Explain quadratic equations with examples"
- "How does photosynthesis work?"
- "Help me solve this math problem: 2x + 5 = 11"
- "What is Newton's first law?"

What would you like to learn about today? 🤔`;
  }

  extractSubjects(message) {
    const subjects = [];
    const subjectKeywords = {
      'Mathematics': ['math', 'algebra', 'geometry', 'calculus', 'equation', 'formula', 'solve'],
      'Physics': ['physics', 'force', 'energy', 'motion', 'newton', 'gravity', 'wave'],
      'Chemistry': ['chemistry', 'element', 'compound', 'reaction', 'molecule', 'atom'],
      'Biology': ['biology', 'cell', 'organism', 'evolution', 'genetics', 'photosynthesis'],
      'English': ['english', 'grammar', 'essay', 'writing', 'literature', 'poem'],
      'History': ['history', 'historical', 'ancient', 'medieval', 'war', 'civilization'],
      'Geography': ['geography', 'continent', 'country', 'climate', 'mountain', 'river']
    };

    const lowerMessage = message.toLowerCase();
    
    Object.entries(subjectKeywords).forEach(([subject, keywords]) => {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        subjects.push(subject);
      }
    });

    return subjects;
  }

  async getChatHistory(studentId, limit = 50) {
    return { messages: [], totalInteractions: 0 };
  }

  async clearChatHistory(studentId) {
    return { success: true };
  }
}

module.exports = new AITutorService();