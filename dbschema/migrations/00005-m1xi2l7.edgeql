CREATE MIGRATION m1xi2l72jf3k25q7j7n66hymu2cjj2dgmocnzjaeivo524zekr3kuq
    ONTO m13plf2u7lalasnoo7un45ex5wwfv5tuudz7cql6xfmdip3xwbx5fq
{
  ALTER TYPE default::Session {
      CREATE INDEX ON (.session_id);
  };
};
