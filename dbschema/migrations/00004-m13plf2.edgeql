CREATE MIGRATION m13plf2u7lalasnoo7un45ex5wwfv5tuudz7cql6xfmdip3xwbx5fq
    ONTO m14srn4veynml5vp43dkbeljuscprfbkmwcjh4t5tbapynwsv5fiza
{
  ALTER TYPE default::User {
      ALTER PROPERTY password {
          RENAME TO hashed_password;
      };
  };
};
