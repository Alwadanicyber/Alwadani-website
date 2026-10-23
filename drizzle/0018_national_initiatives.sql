CREATE TABLE IF NOT EXISTS national_initiatives(id TEXT PRIMARY KEY,title TEXT NOT NULL,description TEXT NOT NULL,school TEXT NOT NULL DEFAULT '',goal INTEGER NOT NULL DEFAULT 100,open INTEGER NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS national_initiative_posts(id TEXT PRIMARY KEY,initiative_id TEXT NOT NULL REFERENCES national_initiatives(id),name TEXT NOT NULL,class_name TEXT NOT NULL DEFAULT '',kind TEXT NOT NULL,text TEXT NOT NULL,image TEXT NOT NULL DEFAULT '',audio TEXT NOT NULL DEFAULT '',status TEXT NOT NULL DEFAULT 'pending',created INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS national_posts_status ON national_initiative_posts(initiative_id,status,created);
CREATE TABLE IF NOT EXISTS national_initiative_limits(bucket TEXT PRIMARY KEY,count INTEGER NOT NULL,expires INTEGER NOT NULL);
INSERT OR IGNORE INTO national_initiatives(id,title,description,goal) VALUES('dir-alwatan','درع الوطن','رسالة شكر، دعاء، أو رسمة لحماة الوطن. كل مشاركة معتمدة تضيء جزءًا من درعنا، ومعًا نكمله.',100);

CREATE TABLE IF NOT EXISTS national_initiative_prayers(id TEXT PRIMARY KEY,initiative_id TEXT NOT NULL REFERENCES national_initiatives(id));
CREATE TABLE IF NOT EXISTS national_initiative_surveys(id TEXT PRIMARY KEY,initiative_id TEXT NOT NULL REFERENCES national_initiatives(id),answers TEXT NOT NULL,rating INTEGER NOT NULL,score INTEGER NOT NULL);
