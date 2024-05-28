CREATE MIGRATION m1inrc5bo6j7lwphxxasxg2hbm5kwwiwhgrxpxnj6blby6agsykvwq
    ONTO m1mfaguvdf6ij7tm4ogckz7qe36hhrq3pdg7afqqjau67wtgsgmasq
{
  ALTER TYPE default::Session {
      CREATE REQUIRED PROPERTY session_id: std::str {
          SET REQUIRED USING (<std::str>{});
          CREATE CONSTRAINT std::exclusive;
      };
  };
};
