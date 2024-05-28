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

    }

    type Session extending Base {
        required user: User;
        required expires_at: datetime;
        required session_id: str {
            constraint exclusive;
        };
    }
}
