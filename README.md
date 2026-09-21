# VisiHire

VisiHire is an AI-powered job search optimization platform designed to help job seekers boost their visibility, network smarter, and land more interviews. By leveraging advanced AI technologies and integrating with LinkedIn, VisiHire provides a suite of tools to streamline and optimize the job search process.

## Features

- **Manual Job Clapper**: Easily track job applications by copy-pasting job descriptions and saving the URL for reference.
- **Kanban Tracking Board**: Visually manage your job search pipeline with a drag-and-drop kanban board.
- **PDF Profile Parser**: Upload your LinkedIn profile PDF and let VisiHire analyze it for optimization insights.
- **ATS Resume & LinkedIn Profile Auditor**: Get AI-powered feedback on your resume and LinkedIn profile, tailored to each job description.
- **Hiring Manager Personalized Outreach**: Generate custom, targeted outreach messages for hiring managers and decision-makers.
- **Structured Context Memory**: VisiHire's AI learns your authentic voice, tech philosophies, and background to create personalized, human-like content.
- **Ghosting Detector & Follow-Up System**: Get alerted when it's time to follow up on an application and generate context-aware follow-up emails.
- **Reverse Inbound Keyword Optimizer**: Discover trending keywords and skills from job listings to optimize your profile.
- **One Post a Week**: Boost your organic visibility with AI-generated LinkedIn posts based on trending articles in your industry.

## Tech Stack

- [Next.js](https://nextjs.org)
- [React](https://reactjs.org)
- [Prisma](https://www.prisma.io)
- [PostgreSQL](https://www.postgresql.org)
- [Gemini API](https://gemini.google.com/)


## Getting Started

1. Clone the repository

git clone https://github.com/yourusername/visihire.git


2. Install dependencies

cd visihire
npm install


3. Set up your PostgreSQL database and update the `.env` file with your database URL

DATABASE_URL="postgresql://username:password@localhost:5432/visihire?schema=public"


4. Run database migrations

npx prisma migrate dev


5. Start the development server

npm run dev


Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
