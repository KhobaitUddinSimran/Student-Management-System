// File: logic/events/GradePublisher.js
class GradePublisher {
    constructor() {
        this.observers = [];
    }

    addObserver(observer) {
        this.observers.push(observer);
    }

    removeObserver(observer) {
        this.observers = this.observers.filter(obs => obs !== observer);
    }

    notifyObservers(grade) {
        this.observers.forEach(observer => {
            try {
                observer.update(grade);
            } catch (error) {
                console.error("Error notifying observer:", error);
            }
        });
    }
}

module.exports = GradePublisher;
