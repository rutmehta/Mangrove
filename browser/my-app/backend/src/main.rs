use std::env;

fn main() {
    let input = env::args().nth(1).expect("No input provided");
    println!("Received input: {}", input);
}