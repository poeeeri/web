document.addEventListener("DOMContentLoaded", function() {
    const epsSlider = document.getElementById("eps_range");
    const epsOutput = document.getElementById("eps_value");

    epsOutput.textContent = epsSlider.value;
    
    epsSlider.addEventListener("input", function() {
        epsOutput.textContent = this.value;
    });

    const slider = document.getElementById("k_range");
    const output = document.getElementById("k_value");

    output.textContent = slider.value;
    
    slider.addEventListener("input", function() {
        output.textContent = this.value;
    });

    const slider1 = document.getElementById("bandwidth");
    const output1 = document.getElementById("rad_value");

    output.textContent = slider.value;
    
    slider1.addEventListener("input", function() {
        output1.textContent = this.value;
    });
});
