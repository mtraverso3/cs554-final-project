"use client"
import { getAllStats } from "@/lib/quizForms";

export function QuizStats({quizId}: {quizId: string}) {
    const stats = getAllStats(quizId);
    const theReturn = stats.then((theStats) => {
        if(theStats === "") {
            return <div>You have not attempted this quiz.</div>;
        }
        const statsObject = JSON.parse(theStats);
        return (<div>
            Number of Attempts: {statsObject.numAttempts}<br></br>
            Last Attempt: {statsObject.recent.score}<br></br>
            Best Attempt: {statsObject.best.score} on {statsObject.best.date}<br></br>
            Average Score: {statsObject.average}
        </div>);
    }, (error) => {
        return <div>Error retrieving stats: {error}</div>;
    });
    return theReturn;
}