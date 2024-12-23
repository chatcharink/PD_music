class CreateDevelopmentUserMappings < ActiveRecord::Migration[7.0]
  def change
    create_table :development_user_mappings do |t|
      t.bigint :tag_id, limit: 20
      t.bigint :user_id, limit: 20
      t.json :development
      t.timestamps
    end
  end
end
