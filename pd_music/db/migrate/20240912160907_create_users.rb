class CreateUsers < ActiveRecord::Migration[7.0]
  def change
    create_table :users do |t|
      t.string :username, limit: 250
      t.string :salt_password, limit: 250
      t.string :password, limit: 250 
      t.string :firstname, limit: 250
      t.string :lastname, limit: 250
      t.datetime :date_of_birth
      t.string :age, limit: 5
      t.text :address
      t.integer :musical_instrument_id, limit: 2
      t.string :others_musical_instrument, limit: 250
      t.string :study_class, limit: 150
      t.string :other_study, limit: 250
      t.column :status, "ENUM('active', 'inactive', 'deleted') DEFAULT 'active'"
      t.integer :role, limit: 2
      t.string :email, limit: 250
      t.string :phone_number, limit: 20
      t.text :profile_pic
      t.string :parent_name, limit: 250
      t.string :parent_lastname, limit: 250
      t.string :parent_phoneno, limit: 20
      t.timestamps
    end
  end
end
