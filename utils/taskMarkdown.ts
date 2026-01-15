interface Task {
    id?: string;
    title: string;
    description?: string;
    goals?: string;
    status?: string;
    type?: string;
    section?: string;
    subsection?: string;
    [key: string]: any;
}

export const generateMarkdown = (tasks: Task[]): string => {
    let md = '';

    // Group tasks by section
    const sections: Record<string, any> = {
        'Active Tasks (Engineering)': {},
        'Inbox / New Ideas': []
    };

    tasks.forEach(task => {
        // Default to Inbox if no section
        const sec = task.section || 'Inbox / New Ideas';

        if (sec === 'Active Tasks (Engineering)') {
            const sub = task.subsection || 'General';
            if (!sections[sec][sub]) sections[sec][sub] = [];
            sections[sec][sub].push(task);
        } else {
            // Handle Inbox or other top-level sections
            if (sec === 'Inbox / New Ideas') {
                sections['Inbox / New Ideas'].push(task);
            } else {
                // Fallback for custom sections
                if (!sections[sec]) sections[sec] = [];
                sections[sec].push(task);
            }
        }
    });

    // 1. Active Tasks (Engineering)
    md += `## Active Tasks (Engineering)\n\n`;
    const activeSubs = sections['Active Tasks (Engineering)'];

    // Sort subsections alphabetically or fixed order if needed
    Object.keys(activeSubs).forEach(sub => {
        md += `### ${sub}\n`;
        activeSubs[sub].forEach((task: Task) => {
            const check = task.status === 'done' ? '[x]' : '[ ]';
            const type = task.type ? `[${task.type.toUpperCase()}]` : '';

            md += `- ${check} **${type} ${task.title}**\n`;

            // Description & Goals
            if (task.description) {
                // Indent description
                md += `    - *Description*: ${task.description}\n`;
            }
            if (task.goals) {
                md += `    - *Goal*: "${task.goals}"\n`;
            }
        });
        md += `\n`;
    });

    md += `___\n\n`;

    // 2. Inbox / New Ideas
    md += `## Inbox / New Ideas\n`;
    const inbox = sections['Inbox / New Ideas'];
    if (inbox.length === 0) {
        md += `*   (Add new requests here)\n`;
    } else {
        inbox.forEach((task: Task) => {
            md += `*   ${task.title}`;
            if (task.description) md += ` - ${task.description}`;
            md += `\n`;
        });
    }

    return md;
}
