class CreateParticipations < ActiveRecord::Migration[7.0]
  def change
    create_table :participations do |t|
      t.bigint :user_id, limit: 20
      t.bigint :subject_id, limit: 20
      t.json :participation
      t.timestamps
    end
  end
end
