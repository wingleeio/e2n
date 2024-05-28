CREATE MIGRATION m14srn4veynml5vp43dkbeljuscprfbkmwcjh4t5tbapynwsv5fiza
    ONTO m1inrc5bo6j7lwphxxasxg2hbm5kwwiwhgrxpxnj6blby6agsykvwq
{
  ALTER TYPE default::User {
      CREATE REQUIRED PROPERTY email: std::str {
          SET REQUIRED USING (<std::str>{});
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY password: std::str {
          SET REQUIRED USING (<std::str>{});
      };
  };
};
