CREATE MIGRATION m1mfaguvdf6ij7tm4ogckz7qe36hhrq3pdg7afqqjau67wtgsgmasq
    ONTO initial
{
  CREATE ABSTRACT TYPE default::Base {
      CREATE REQUIRED PROPERTY created_at: std::datetime {
          SET default := (std::datetime_current());
          SET readonly := true;
      };
      CREATE REQUIRED PROPERTY updated_at: std::datetime {
          SET default := (std::datetime_current());
          CREATE REWRITE
              INSERT 
              USING (std::datetime_of_statement());
          CREATE REWRITE
              UPDATE 
              USING (std::datetime_of_statement());
      };
  };
  CREATE TYPE default::User EXTENDING default::Base;
  CREATE TYPE default::Session EXTENDING default::Base {
      CREATE REQUIRED LINK user: default::User;
      CREATE REQUIRED PROPERTY expires_at: std::datetime;
  };
};
