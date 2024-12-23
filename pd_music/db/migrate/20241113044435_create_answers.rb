class CreateAnswers < ActiveRecord::Migration[7.0]
  def change
    create_table :answers do |t|
      t.bigint :homework_id, limit: 20
      t.bigint :question_no, limit: 20
      t.bigint :user_id, limit: 20
      t.integer :current_score
      t.integer :current_progress
      t.integer :current_reveal_time
      t.string :answer
      t.string :upload_answer
      t.string :secondary_upload_answer
      t.timestamps
    end
  end
end
