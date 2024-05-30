module default {
    abstract type Base {
        required created_at: datetime {
            default := datetime_current();
            readonly := true;
        };
        required updated_at: datetime {
            default := datetime_current();
            rewrite insert using (datetime_of_statement());
            rewrite update using (datetime_of_statement());
        };
    }

    type User extending Base {
        required email: str {
            constraint exclusive;
        };
        required hashed_password: str;
        required email_verified: bool;
    }

    type Session extending Base {
        required user: User;
        required expires_at: datetime;
        required session_id: str {
            constraint exclusive;
        };
        index on ((.session_id));
    }

    type EmailVerificationCode extending Base {
        required user: User {
            constraint exclusive;
        };
        required code: str;
        required expires_at: datetime;
        index on ((.user));
    }
}
