export interface Codingmark {
    _id?: string;
    name: string;
    location: string;
    description: string;
    descriptionHtml: string;
    tags: string[];
    tagsLine?: string;
    publishedOn?: Date;
    githubURL?: string;
    userId?: String;
    shared?: boolean;
    language: string;
    createdAt?: Date;
    updatedAt?: Date;
    starredBy?: string[];
}
