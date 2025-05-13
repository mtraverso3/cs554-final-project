"use client"

export function QuizStats({stats}: {stats: string}) {
    console.log(stats);
    if(stats === "") {
        return <div>You have not attempted this quiz.</div>;
    }
    const statsObject = JSON.parse(stats);
    return (<div>
        Number of Attempts: {statsObject.numAttempts}<br></br>
        Last Attempt: {statsObject.recent.score}<br></br>
        Best Attempt: {statsObject.best.score} on {statsObject.best.date}<br></br>
        Average Score: {statsObject.average}
    </div>);

}