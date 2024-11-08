class CreateQuestions < ActiveRecord::Migration[7.0]
  def change
    create_table :questions do |t|
      t.bigint :question_no, limit: 20
      t.text :question
      t.text :question_media
      t.bigint :answer_format, limit: 20
      t.text :chords
      t.bigint :choice_no, limit: 20
      t.text :answer
      t.string :correct_answer
      t.integer :option, limit: 2
      t.text :reveal
      t.bigint :homework_id, limit: 20
      t.timestamps
    end
  end
end
